import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { useToastStore } from "@/stores/useToastStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { Download, Calendar, Clock, TrendingUp, FileBarChart } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
export default function AdminReportsPage() {
    const [isGenerating, setIsGenerating] = useState(null);
    const addToast = useToastStore((s) => s.addToast);
    const settings = useSettingsStore();
    const generateReport = async (type) => {
        setIsGenerating(type);
        try {
            const now = new Date();
            let startDate = new Date();
            if (type === "daily")
                startDate.setHours(0, 0, 0, 0);
            else if (type === "weekly")
                startDate.setDate(now.getDate() - 7);
            else if (type === "monthly")
                startDate.setMonth(now.getMonth() - 1);
            const { data: orders, error } = await supabase
                .from("orders")
                .select("*, items:order_items(*)")
                .gte("created_at", startDate.toISOString())
                .order("created_at", { ascending: false });
            if (error)
                throw error;
            if (!orders || orders.length === 0) {
                addToast({ type: "warning", title: "No data found", description: `No orders found for the ${type} period.` });
                return;
            }
            // PDF Generation
            const doc = new jsPDF();
            // Header
            doc.setFontSize(22);
            doc.setTextColor(33, 33, 33);
            doc.text(`${settings.storeName.toUpperCase()} E-COMMERCE`, 14, 22);
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`${type.toUpperCase()} SALES REPORT`, 14, 30);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 35);
            const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
            const totalItems = orders.reduce((sum, o) => sum + o.items.length, 0);
            // Summary Box
            doc.setFillColor(245, 245, 245);
            doc.rect(14, 45, 182, 30, 'F');
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text("Total Revenue", 20, 55);
            doc.text("Total Orders", 80, 55);
            doc.text("Items Sold", 140, 55);
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text(formatPrice(totalRevenue), 20, 65);
            doc.text(orders.length.toString(), 80, 65);
            doc.text(totalItems.toString(), 140, 65);
            // Table
            const tableData = orders.map((o) => [
                o.id.slice(0, 8).toUpperCase(),
                new Date(o.created_at).toLocaleDateString(),
                o.full_name,
                o.payment_method.toUpperCase(),
                o.status.toUpperCase(),
                formatPrice(o.total)
            ]);
            autoTable(doc, {
                startY: 85,
                head: [['Order ID', 'Date', 'Customer', 'Payment', 'Status', 'Total']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
                alternateRowStyles: { fillColor: [250, 250, 250] },
            });
            doc.save(`${settings.storeName}-${type}-report-${Date.now()}.pdf`);
            addToast({ type: "success", title: "Report Generated", description: "Your PDF is ready for download." });
        }
        catch (err) {
            addToast({ type: "error", title: "Report Generation Failed", description: err.message });
        }
        finally {
            setIsGenerating(null);
        }
    };
    const reportCards = [
        {
            id: "daily",
            title: "Daily Report",
            desc: "Summary of today's sales and performance.",
            icon: Clock,
            color: "bg-primary/10 text-primary"
        },
        {
            id: "weekly",
            title: "Weekly Report",
            desc: "Analyze your performance over the last 7 days.",
            icon: Calendar,
            color: "bg-gold/10 text-gold"
        },
        {
            id: "monthly",
            title: "Monthly Report",
            desc: "Deep dive into this month's revenue and inventory.",
            icon: TrendingUp,
            color: "bg-success/10 text-success"
        }
    ];
    return (<div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Financial Reports</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Generate and export professional PDF business reports
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reportCards.map((card) => (<div key={card.id} className="bg-white border border-border rounded-3xl p-8 hover:shadow-xl hover:shadow-primary/5 transition-all group">
            <div className={`w-14 h-14 rounded-2xl ${card.color} flex items-center justify-center mb-6`}>
              <card.icon className="w-7 h-7"/>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{card.title}</h2>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              {card.desc}
            </p>
            <Button className="w-full rounded-2xl py-6" isLoading={isGenerating === card.id} onClick={() => generateReport(card.id)}>
              <Download className="w-4 h-4 mr-2"/>
              Generate PDF
            </Button>
          </div>))}
      </div>

      {/* Custom Report Card */}
      <div className="bg-black text-white rounded-[2rem] p-10 flex flex-wrap items-center justify-between gap-8">
        <div className="space-y-4 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-widest">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"/>
            Premium Feature
          </div>
          <h2 className="text-4xl font-black tracking-tighter">Business Intelligence</h2>
          <p className="text-white/60 leading-relaxed text-lg">
            Need custom insights? Our advanced analytics engine can generate predictive reports based on your sales history and inventory trends.
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <Button variant="secondary" className="px-10 py-8 text-lg rounded-2xl font-bold">
            <FileBarChart className="w-5 h-5 mr-3"/>
            Explore BI
          </Button>
        </div>
      </div>
    </div>);
}
