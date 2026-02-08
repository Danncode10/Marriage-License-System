import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const scriptPath = path.join(process.cwd(), "..", "necessary", "convert_to_excel.py");

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
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
