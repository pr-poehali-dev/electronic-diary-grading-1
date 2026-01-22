import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface LoginPageProps {
  loginForm: { username: string; password: string };
  setLoginForm: (form: { username: string; password: string }) => void;
  handleLogin: () => void;
  isLoading: boolean;
}

const LoginPage = ({ loginForm, setLoginForm, handleLogin, isLoading }: LoginPageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <Icon name="GraduationCap" size={48} className="text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Электронный дневник</CardTitle>
          <CardDescription>Войдите в систему для доступа</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Логин</Label>
            <Input
              id="username"
              value={loginForm.username}
              onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
              placeholder="kostya"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              placeholder="••••••••"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
          <Button className="w-full" onClick={handleLogin} disabled={isLoading}>
            {isLoading ? 'Вход...' : 'Войти'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
