
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc, getFirestore } from 'firebase/firestore';
import { useAuth } from '@/firebase/provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { firebaseApp } from '@/firebase/config';

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_17_80)">
            <path d="M47.532 24.5528C47.532 22.9214 47.3998 21.2899 47.1113 19.6585H24.2371V28.618H37.4396C36.9248 31.6214 35.3235 34.195 32.9396 35.8757V41.5959H40.2371C44.757 37.5257 47.532 31.6214 47.532 24.5528Z" fill="#4285F4"/>
            <path d="M24.2371 48.0001C30.8623 48.0001 36.4396 45.8358 40.2371 41.5959L32.9396 35.8757C30.6998 37.4286 27.7823 38.3358 24.2371 38.3358C17.6119 38.3358 12.0346 33.9143 10.0546 28.2429H2.56445V34.0143C6.36195 41.85 14.6119 48.0001 24.2371 48.0001Z" fill="#34A853"/>
            <path d="M10.0546 28.2428C9.53982 26.6643 9.23714 25.0328 9.23714 23.35C9.23714 21.6671 9.53982 20.0357 10.0055 18.4571V12.6857H2.56445C0.914062 15.9357 0 19.5357 0 23.35C0 27.1643 0.914062 30.7643 2.56445 34.0143L10.0546 28.2428Z" fill="#FBBC05"/>
            <path d="M24.2371 9.36429C27.2055 9.36429 29.8298 10.3714 32.07 12.4286L40.3746 4.12429C36.3905 0.524286 30.8132 0 24.2371 0C14.6119 0 6.36195 6.15001 2.56445 12.6857L10.0055 18.4571C12.0346 12.7857 17.6119 9.36429 24.2371 9.36429Z" fill="#EA4335"/>
        </g>
        <defs>
            <clipPath id="clip0_17_80">
            <rect width="48" height="48" fill="white"/>
            </clipPath>
        </defs>
    </svg>
);


export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/');
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [auth, router]);

  const handleAuthAction = async (action: 'signUp' | 'signIn') => {
    if (!auth) return;
    setAuthLoading(true);
    try {
      const firestore = getFirestore(firebaseApp);
      let userCredential;
      if (action === 'signUp') {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await setDoc(doc(firestore, "users", user.uid), {
           groups: [],
           athkarLog: {}
        });
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      router.push('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "حدث خطأ",
        description: error.message,
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    setAuthLoading(true);
    try {
      const firestore = getFirestore(firebaseApp);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const docRef = doc(firestore, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(docRef, {
           groups: [],
           athkarLog: {}
        });
      }
      router.push('/');
    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "حدث خطأ",
        description: error.message,
      });
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg">جاري التحقق من جلسة الدخول...</p>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-sm mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">أذكاري</CardTitle>
          <CardDescription>
            سجّل دخولك أو أنشئ حسابًا جديدًا لحفظ أذكارك ومزامنتها.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signIn" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signIn">تسجيل الدخول</TabsTrigger>
              <TabsTrigger value="signUp">حساب جديد</TabsTrigger>
            </TabsList>
            <TabsContent value="signIn">
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email-signin">البريد الإلكتروني</Label>
                  <Input id="email-signin" type="email" placeholder="example@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signin">كلمة المرور</Label>
                  <Input id="password-signin" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <Button onClick={() => handleAuthAction('signIn')} disabled={authLoading} className="w-full">
                  {authLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  تسجيل الدخول
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="signUp">
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email-signup">البريد الإلكتروني</Label>
                  <Input id="email-signup" type="email" placeholder="example@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup">كلمة المرور</Label>
                  <Input id="password-signup" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <Button onClick={() => handleAuthAction('signUp')} disabled={authLoading} className="w-full">
                  {authLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  إنشاء حساب
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">أو</span>
            </div>
          </div>
          <Button variant="outline" onClick={handleGoogleSignIn} disabled={authLoading} className="w-full">
             {authLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
            المتابعة باستخدام جوجل
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
