import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

const Navbar = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const navigate = useNavigate();
  const { user: storedUser, isLoading } = useUser();

  const tabs = [
    { label: "상품관리", path: "/goods/list" },
    { label: "상품등록", path: "/goods/register" },
    { label: "금칙어관리", path: "/forbidden-words" }
  ];

  // if(!isLoading && storedUser?.adminYn === "Y") {
  //   tabs.push({ label: "상품등록", path: "/goods/register" });
  // }

  return (
    <nav
      className={`flex items-center justify-center`}
    >
      {tabs.map((tab) => (
        <button
          key={tab.path}
          onClick={() => navigate(tab.path)}
          className={`relative px-6 py-3 text-sm font-medium transition-all duration-100 text-white ${
            window.location.pathname === tab.path
              ? isDarkMode
                ? "bg-blue-600"
                : "bg-blue-500"
              : isDarkMode
              ? "text-gray-400 hover:text-white"
              : "text-gray-600 hover:text-black"
          } rounded-t-md rounded-b-none mx-0`}
        >
          {tab.label}
          {window.location.pathname === tab.path && (
            <span
              className={`absolute -bottom-1 left-0 right-0 h-1 ${
                isDarkMode ? "bg-blue-500" : "bg-blue-600"
              }`}
            ></span>
          )}
        </button>
      ))}
    </nav>
  );
};

export default Navbar;
