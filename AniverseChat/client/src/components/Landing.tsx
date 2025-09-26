import { Button } from "@/components/ui/button";
import { LogIn, Star, Book, Users } from "lucide-react";
import animeAvatar from "@assets/a3922c432494e8836b1e11e9722c7115_1755968455298.jpg";

export function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark-bg via-dark-bg to-dark-surface"></div>
      <div className="absolute inset-0 bg-[url('/src/assets/artworks-000496368060-wd4wu9-t500x500_1755966582158.jpg')] bg-cover bg-center opacity-10"></div>
      
      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full border-4 border-anime-orange overflow-hidden">
              <img src={animeAvatar} alt="AniVerse AI" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-white">AniVerse AI</h1>
              <p className="text-sm text-gray-400">Manga & Anime Intelligence</p>
            </div>
          </div>
          <Button 
            onClick={handleLogin}
            className="send-button px-6 py-2 rounded-xl text-white font-medium flex items-center space-x-2"
            data-testid="button-login"
          >
            <LogIn className="w-4 h-4" />
            <span>Login</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="w-24 h-24 mx-auto mb-8 rounded-full border-4 border-anime-orange overflow-hidden">
            <img src={animeAvatar} alt="AniVerse AI" className="w-full h-full object-cover" />
          </div>
          
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-6 text-white">
            Welcome to AniVerse AI
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Your intelligent companion for everything Manga & Anime. Get personalized recommendations, 
            character analysis, and dive deep into your favorite series.
          </p>

          <div className="glass-surface rounded-2xl p-8 mb-8">
            <h3 className="text-2xl font-bold mb-6 text-white">What You Can Do</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-anime-orange/20 rounded-full flex items-center justify-center">
                  <Book className="w-8 h-8 text-anime-orange" />
                </div>
                <h4 className="text-lg font-semibold mb-2 text-white">Manga Recommendations</h4>
                <p className="text-gray-400">Get personalized manga suggestions based on your preferences</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-anime-orange/20 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-anime-orange" />
                </div>
                <h4 className="text-lg font-semibold mb-2 text-white">Character Analysis</h4>
                <p className="text-gray-400">Deep dive into character development and story arcs</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-anime-orange/20 rounded-full flex items-center justify-center">
                  <Star className="w-8 h-8 text-anime-orange" />
                </div>
                <h4 className="text-lg font-semibold mb-2 text-white">Anime Reviews</h4>
                <p className="text-gray-400">Discover trending series and hidden gems</p>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleLogin}
            size="lg"
            className="send-button px-8 py-4 text-lg rounded-xl text-white font-medium flex items-center space-x-3 mx-auto"
            data-testid="button-login-main"
          >
            <LogIn className="w-5 h-5" />
            <span>Get Started - Login to Continue</span>
          </Button>
          
          <p className="text-sm text-gray-400 mt-4">
            Login with your account to access personalized chat sessions
          </p>
        </div>
      </main>
    </div>
  );
}