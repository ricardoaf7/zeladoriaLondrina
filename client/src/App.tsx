import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import DashboardEficiencia from "@/pages/DashboardEficiencia";
import OCRImport from "@/pages/OCRImport";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import Dashboard from "@/pages/dashboard";
import ImportCSV from "@/pages/ImportCSV";
import MapPerformanceDemo from "@/pages/MapPerformanceDemo";
import ConsultaColetaPublica from "@/pages/ConsultaColetaPublica";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/import-csv" component={ImportCSV} />
      <Route path="/map-performance" component={MapPerformanceDemo} />
      <Route path="/consulta-coleta" component={ConsultaColetaPublica} />
      <Route path="/dashboard-eficiencia" component={DashboardEficiencia} />
      <Route path="/ocr-import" component={OCRImport} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
