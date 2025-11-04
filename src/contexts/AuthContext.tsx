import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { UserRole, UserProfile } from '@/types/user';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isSuperAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Carica il profilo utente da Firestore
        const profileRef = doc(db, 'userProfiles', user.uid);
        const profileSnap = await getDoc(profileRef);
        
        if (profileSnap.exists()) {
          setUserProfile(profileSnap.data() as UserProfile);
        } else {
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login effettuato",
        description: "Benvenuto!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Errore login",
        description: error.message,
      });
      throw error;
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Crea il profilo utente con ruolo 'user' di default
      const userProfileData: UserProfile = {
        userId: userCredential.user.uid,
        email: userCredential.user.email || email,
        role: 'user',
        createdAt: new Date(),
      };
      
      await setDoc(doc(db, 'userProfiles', userCredential.user.uid), userProfileData);
      
      toast({
        title: "Registrazione completata",
        description: "Account creato con successo!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Errore registrazione",
        description: error.message,
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logout effettuato",
        description: "A presto!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Errore logout",
        description: error.message,
      });
      throw error;
    }
  };

  const isSuperAdmin = userProfile?.role === 'super_admin';

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, isSuperAdmin, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
