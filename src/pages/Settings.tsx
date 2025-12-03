import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useAuthStore } from '../store/useAuthStore';

export const Settings = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      
      <Card title="Profile Information">
        <div className="space-y-4 max-w-md">
          <div className="flex items-center gap-4 mb-6">
            <img 
              src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}`} 
              alt="Avatar" 
              className="w-16 h-16 rounded-full"
            />
            <div>
              <Button variant="secondary" size="sm">Change Avatar</Button>
            </div>
          </div>

          <Input label="Full Name" defaultValue={user?.name} />
          <Input label="Email Address" defaultValue={user?.email} disabled />
          <Input label="Role" defaultValue={user?.role} disabled />
          
          <div className="pt-4">
            <Button>Save Changes</Button>
          </div>
        </div>
      </Card>

      <Card title="Preferences">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Email Notifications</h4>
              <p className="text-sm text-muted-foreground">Receive emails about your account activity.</p>
            </div>
            <input type="checkbox" className="toggle" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Dark Mode</h4>
              <p className="text-sm text-muted-foreground">Toggle dark mode theme.</p>
            </div>
            <input type="checkbox" className="toggle" />
          </div>
        </div>
      </Card>
    </div>
  );
};
