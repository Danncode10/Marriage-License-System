import { getAllApplications, getCurrentUserRole } from "./actions";
import GlobalOversightClient from "./GlobalOversightClient";

export const dynamic = "force-dynamic";

interface PageProps {
    searchParams: { [key: string]: string | string[] | undefined };
}

export default async function GlobalApplicationsPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    // Next.js 15+ REQUIRES searchParams to be awaited (MUST BE PROMISE)
    const sParams = await searchParams;

    const page = typeof sParams.page === 'string' ? Math.max(1, parseInt(sParams.page) || 1) : 1;
    const limit = typeof sParams.limit === 'string' ? Math.max(1, parseInt(sParams.limit) || 50) : 50;

    try {
        const [result, role] = await Promise.all([
            getAllApplications(page, limit),
            getCurrentUserRole()
        ]);

        return (
            <div className="space-y-8 animate-in fade-in duration-700">
                <GlobalOversightClient
                    apps={result.apps || []}
                    totalCount={result.totalCount || 0}
                    totalPages={result.totalPages || 0}
                    currentPage={result.currentPage || 1}
                    limit={result.limit || 50}
                    userRole={role}
                />
            </div>
        );
    } catch (error) {
        console.error("Failed to load applications page:", error);
        return (
            <div className="p-12 text-center bg-zinc-50 rounded-[3rem] border-2 border-dashed border-zinc-200">
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Error loading applications</p>
                <a
                    href="/dashboard/admin/applications"
                    className="mt-4 inline-block px-6 py-2 bg-zinc-900 text-white rounded-xl font-bold text-sm"
                >
                    Retry Connection
                </a>
            </div>
        );
    }
}
