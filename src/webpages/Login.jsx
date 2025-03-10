import Header from "../components/Header.jsx";
import LoginForm from "../components/LoginForm.jsx";
import Footer from "../components/Footer.jsx";
import "./LoginSyle.css";

function Login() {
  return (
    <div className="login-page">
      <Header />
      <LoginForm />
      <Footer />
    </div>
  );
}

export default Login;
