import { LuLibrary } from "react-icons/lu";
import { PiGraphLight } from "react-icons/pi";
import { CiUser } from "react-icons/ci";

export default function Menu() {
  return (
    <div className="menu-container bg-black flex-col justify-center items-start px-1">
      <PiGraphLight className="menu-item" />
      <LuLibrary className="menu-item mt-1" />
      <CiUser className="menu-item mt-1" />
    </div>
  );
}
