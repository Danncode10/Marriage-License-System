import { getAllApplications } from "./actions";
import GlobalOversightClient from "./GlobalOversightClient";

export const dynamic = "force-dynamic";

interface PageProps {
    searchParams: { [key: string]: string | string[] | undefined };
}

export default async function GlobalApplicationsPage({ searchParams }: PageProps) {
    const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
    const limit = typeof searchParams.limit === 'string' ? parseInt(searchParams.limit) : 50;

    const result = await getAllApplications(page, limit);
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <GlobalOversightClient
                apps={result.apps}
                totalCount={result.totalCount}
                totalPages={result.totalPages}
                currentPage={result.currentPage || 1}
                limit={result.limit || 50}
            />
        </div>
    );
}
