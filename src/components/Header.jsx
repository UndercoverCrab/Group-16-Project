export default Header;
import { Link } from "react-router-dom";

function Header({ role }) {  

  return (
    <header>
      {/* Only show Event Management button for admins */}
      {role === "admin" && (
        <Link to="/event-management">
          <button>Admin Panel</button>
        </Link>
      )}
      <p>Header</p>
    </header>
  );
}

export default Header;
