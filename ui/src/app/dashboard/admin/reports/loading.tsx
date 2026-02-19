import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminReportsLoading() {
    return (
        <div className="space-y-8">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <Skeleton className="h-9 w-64" />
                    <Skeleton className="h-4 w-80" />
                </div>
                <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-24" />
                </div>
            </div>

            {/* Key Metrics Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="rounded-[2rem] border-zinc-100 shadow-xl shadow-zinc-200/40 overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16 mb-1" />
                            <Skeleton className="h-3 w-20" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="rounded-[2.5rem] border-zinc-100 shadow-xl shadow-zinc-200/40">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-6 w-6" />
                                <Skeleton className="h-6 w-48" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {Array.from({ length: 5 }).map((_, j) => (
                                <div key={j} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-3 w-3 rounded-full" />
                                        <Skeleton className="h-4 w-16" />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-4 w-8" />
                                        <Skeleton className="h-3 w-8" />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Trends Skeleton */}
            <Card className="rounded-[2.5rem] border-zinc-100 shadow-xl shadow-zinc-200/40">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-6" />
                        <Skeleton className="h-6 w-32" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="text-center p-4 bg-zinc-50 rounded-2xl">
                                <Skeleton className="h-8 w-8 mx-auto mb-2" />
                                <Skeleton className="h-3 w-12 mx-auto" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}