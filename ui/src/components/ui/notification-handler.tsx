"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Alert } from "./alert";
import { AnimatePresence } from "framer-motion";

export function NotificationHandler() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const error = searchParams.get("error");
    const message = searchParams.get("message");

    const clearParams = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("error");
        params.delete("message");
        router.replace(`?${params.toString()}`);
    };

    return (
        <div className="mb-6 space-y-2">
            <AnimatePresence mode="wait">
                {error && (
                    <Alert
                        key="error"
                        type="error"
                        message={decodeURIComponent(error)}
                        onClose={clearParams}
                    />
                )}
                {message && (
                    <Alert
                        key="message"
                        type="success"
                        message={decodeURIComponent(message)}
                        onClose={clearParams}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
