import React, { useEffect } from "react";
import { UserCircle, Home } from "lucide-react";
import { useUser } from "../hooks/UserInfo";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
  const { username } = useUser();
  const [date, setDate] = React.useState<string>("");

  const navigate = useNavigate();

  useEffect(() => {
    setDate(
      new Date().toLocaleDateString("it-IT", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
  }, []);

  return (
    <header className="flex justify-between gap-4 mb-6 px-2 md:px-0">
      <div
        className="flex items-center gap-2"
        onClick={() => {
          navigate("/");
        }}
      >
        <Home color="white" size={25} />
      </div>

      <div className="flex items-center gap-2">
        <div className="bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-full p-2">
          <UserCircle className="w-10 h-10 text-white" />
        </div>
        <div>
          <div className="text-lg font-semibold text-white">
            Ciao, {username}!
          </div>
          <div className="text-xs text-gray-400">{date}</div>
        </div>
      </div>
    </header>
  );
};

export default Header;
