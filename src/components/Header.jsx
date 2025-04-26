import { Link } from "react-router-dom";

function Header() {
  return (
    <header>
      <Link to="/event-management">
        {" "}
        <button>Admin Panel</button>
      </Link>
      <p>Header</p>
    </header>
  );
}

export default Header;
