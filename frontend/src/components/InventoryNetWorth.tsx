import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Receipt } from "lucide-react";
import { dataConnector, NetWorthData } from "@/lib/dataConnector";

export const InventoryNetWorth = () => {
    const [netWorthData, setNetWorthData] = useState<NetWorthData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchNetWorth();
    }, []);

    const fetchNetWorth = async () => {
        try {
            setIsLoading(true);
            const data = await dataConnector.getNetWorth();
            setNetWorthData(data);
        } catch (error) {
            console.error("Failed to fetch net worth:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(value);
    };

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Loading...</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">-</div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (!netWorthData) return null;

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Net Worth (with Tax)
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {formatCurrency(netWorthData.netWorth)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Total inventory value including tax
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Value (without Tax)
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {formatCurrency(netWorthData.netWorthWithoutTax)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Base inventory value
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Tax</CardTitle>
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {formatCurrency(netWorthData.totalTax)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Accumulated tax amount
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};
