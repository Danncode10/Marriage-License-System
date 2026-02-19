import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import { createClient } from "@/utils/supabase/server-utils";
import fs from "fs";

export async function POST(req: NextRequest) {
    let tempImagePath: string | null = null;

    try {
        const body = await req.json();
        const scriptPath = path.join(process.cwd(), "..", "necessary", "convert_to_excel.py");

        // Check if we have an application code to download the couple image
        if (body.applicationCode) {
            try {
                const supabase = await createClient();
                if (!supabase) {
                    throw new Error("Failed to create Supabase client");
                }

                // Construct the image path: marriage-license-files/{application_code}.jpg
                const imagePath = `${body.applicationCode.toUpperCase()}.jpg`;

                // Download the image from Supabase storage
                const { data, error } = await supabase.storage
                    .from("marriage-license-files")
                    .download(imagePath);

                if (error) {
                    console.error("Error downloading image from Supabase:", error);
                    // Continue without image - will use placeholder
                } else {
                    // Save to temporary file
                    const tempDir = path.join(process.cwd(), "temp");
                    if (!fs.existsSync(tempDir)) {
                        fs.mkdirSync(tempDir, { recursive: true });
                    }

                    tempImagePath = path.join(tempDir, `couple_${Date.now()}.png`);
                    const buffer = Buffer.from(await data.arrayBuffer());
                    fs.writeFileSync(tempImagePath, buffer);

                    // Update the body to use the temporary image path
                    body.coupleImagePath = tempImagePath;
                }
            } catch (imageError) {
                console.error("Error handling image download:", imageError);
                // Continue without image
            }
        }

        return new Promise<NextResponse>((resolve) => {
            const pythonProcess = spawn("python3", [scriptPath]);

            let buffers: Buffer[] = [];
            let errorData = "";

            pythonProcess.stdin.write(JSON.stringify(body));
            pythonProcess.stdin.end();

            pythonProcess.stdout.on("data", (data) => {
                buffers.push(data);
            });

            pythonProcess.stderr.on("data", (data) => {
                errorData += data.toString();
            });

            pythonProcess.on("close", (code) => {
                // Clean up temporary image file
                if (tempImagePath && fs.existsSync(tempImagePath)) {
                    try {
                        fs.unlinkSync(tempImagePath);
                    } catch (cleanupError) {
                        console.error("Error cleaning up temp image:", cleanupError);
                    }
                }

                if (code !== 0) {
                    console.error("Python error:", errorData);
                    resolve(NextResponse.json({ error: "Failed to generate Excel", details: errorData }, { status: 500 }));
                } else {
                    const resultBuffer = Buffer.concat(buffers);
                    resolve(new NextResponse(resultBuffer, {
                        status: 200,
                        headers: {
                            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                            "Content-Disposition": `attachment; filename="MARRIAGE_APPLICATION.xlsx"`,
                        },
                    }));
                }
            });
        });
    } catch (error: any) {
        // Clean up temporary image file in case of error
        if (tempImagePath && fs.existsSync(tempImagePath)) {
            try {
                fs.unlinkSync(tempImagePath);
            } catch (cleanupError) {
                console.error("Error cleaning up temp image:", cleanupError);
            }
        }

        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
