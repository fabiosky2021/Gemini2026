import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';

export default function Login() {
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Erro ao fazer login:", error);
    }
  };

  return (
    <button 
      onClick={handleLogin}
      className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
    >
      Entrar com Google
    </button>
  );
}
