import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function CardSkeleton() {
    return (
        <Card className="w-full h-full bg-blue-900/40 border-blue-800/60 backdrop-blur-md shadow-xl">
            <CardContent className="p-6">
                <div className="flex flex-col justify-between h-full">
                    <div>
                        <Skeleton className="w-20 h-6 rounded mb-2" />
                        <div className="flex flex-row">
                            <Skeleton className="mr-4 w-24 h-24 rounded-full" />
                            <div className="flex flex-col flex-grow">
                                <Skeleton className="w-3/4 h-6 rounded mb-2" />
                                <Skeleton className="w-1/2 h-4 rounded mb-2" />
                                <Skeleton className="w-full h-4 rounded" />
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 w-full">
                        <Skeleton className="w-full h-10 rounded" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
