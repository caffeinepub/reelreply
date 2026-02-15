import DashboardLayout from '../components/layout/DashboardLayout';
import ComplianceNotice from '../components/dashboard/ComplianceNotice';
import InstagramConnectionSection from '../components/dashboard/InstagramConnectionSection';
import AutomationSettingsSection from '../components/dashboard/AutomationSettingsSection';
import LogsSection from '../components/dashboard/LogsSection';
import { Separator } from '@/components/ui/separator';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your Instagram automation settings and view reply logs
          </p>
        </div>

        <ComplianceNotice />

        <Separator className="bg-border/40" />

        <InstagramConnectionSection />

        <Separator className="bg-border/40" />

        <AutomationSettingsSection />

        <Separator className="bg-border/40" />

        <LogsSection />
      </div>
    </DashboardLayout>
  );
}
