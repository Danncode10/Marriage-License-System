import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { createAdminClient, createClient } from "@/utils/supabase/server-utils";
import fs from "fs";
import os from "os";
import { ExcelGenerator } from "@/utils/excel/excel-generator";

export async function POST(req: NextRequest) {
    let tempImagePath: string | null = null;

    try {
        const body = await req.json();

        // Get current user for Employee Name recording
        try {
            const supabase = await createClient();
            if (supabase) {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    let name = user.user_metadata?.full_name;

                    if (!name) {
                        const { data: profile } = await supabase
                            .from("profiles")
                            .select("full_name")
                            .eq("id", user.id)
                            .single();
                        name = profile?.full_name;
                    }

                    body.employeeName = name || user.email;
                    console.log(`Setting employeeName for Excel export: ${body.employeeName}`);
                }
            }
        } catch (authError) {
            console.error("Error retrieving user session for Excel generation:", authError);
        }

        const appCode = (body.applicationCode || '').toUpperCase();

        // 1. Handle Image Download (keep existing logic)
        if (appCode) {
            console.log("Attempting to download image for application code:", appCode);
            try {
                const supabase = createAdminClient();

                const { data: appData } = await supabase
                    .from("marriage_applications")
                    .select("id")
                    .eq("application_code", appCode)
                    .single();

                let imagePath: string | null = null;

                if (appData?.id) {
                    const { data: photoData } = await supabase
                        .from("application_photos")
                        .select("file_path")
                        .eq("application_id", appData.id)
                        .single();

                    if (photoData?.file_path) {
                        imagePath = photoData.file_path;
                    }
                }

                if (!imagePath) {
                    imagePath = `${appCode}.jpg`;
                }

                const { data, error } = await supabase.storage
                    .from("marriage-license-files")
                    .download(imagePath);

                if (data) {
                    await saveTempImage(data, imagePath!);
                } else if (error) {
                    console.error(`[ExcelGen] Failed to download image at ${imagePath}:`, error.message);

                    // Fallback strategy: try common extensions if the specific one fails
                    const extensions = ['jpg', 'jpeg', 'png', 'JPG', 'JPEG', 'PNG'];
                    let downloaded = false;

                    for (const ext of extensions) {
                        const fallbackPath = `${appCode}.${ext}`;
                        if (fallbackPath === imagePath) continue;

                        console.log(`[ExcelGen] Trying fallback path: ${fallbackPath}`);
                        const { data: fallbackData } = await supabase.storage
                            .from("marriage-license-files")
                            .download(fallbackPath);

                        if (fallbackData) {
                            await saveTempImage(fallbackData, fallbackPath);
                            downloaded = true;
                            break;
                        }
                    }

                    if (!downloaded) {
                        console.warn(`[ExcelGen] No image found for ${appCode} after trying fallbacks.`);
                    }
                }

                async function saveTempImage(data: Blob, imgPath: string) {
                    const tempDir = path.join(os.tmpdir(), "solano-mls");
                    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

                    // Preserve original extension (case-insensitive)
                    const ext = imgPath.split('.').pop()?.toLowerCase() || 'png';
                    tempImagePath = path.join(tempDir, `couple_${Date.now()}.${ext}`);
                    const buffer = Buffer.from(await data.arrayBuffer());
                    fs.writeFileSync(tempImagePath, buffer);
                    body.coupleImagePath = tempImagePath;
                    body.imageExtension = ext;
                }
            } catch (imageError) {
                console.error("Error handling image download:", imageError);
            }
        }

        // 2. Generate Excel using the new Node.js generator
        const generator = new ExcelGenerator();
        const buffer = await generator.generate(body);

        return new NextResponse(new Uint8Array(buffer), {
            status: 200,
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename="MARRIAGE_APPLICATION_${body.applicationCode || 'DRAFT'}.xlsx"`,
            },
        });

    } catch (error: any) {
        console.error("=== Excel Generation CRITICAL ERROR ===");
        console.error("Error Name:", error.name);
        console.error("Error Message:", error.message);
        console.error("Stack Trace:", error.stack);

        // Log environment info that might be relevant
        console.error("Working Directory:", process.cwd());

        return NextResponse.json({
            error: "Excel Generation Failed",
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    } finally {
        // Cleanup temp image
        if (tempImagePath && fs.existsSync(tempImagePath)) {
            try {
                fs.unlinkSync(tempImagePath);
            } catch (cleanupError) {
                console.error("Error cleaning up temp image:", cleanupError);
            }
        }
    }
}
