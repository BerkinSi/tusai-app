import HomeClient from "./HomeClient";
import AuthRedirector from "./AuthRedirector";

export default function HomePage() {
  return (
    <AuthRedirector>
      <HomeClient />
    </AuthRedirector>
  );
}
