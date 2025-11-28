import { useEffect, useMemo, useRef } from "react";
import { ArcwareInit } from "@arcware-cloud/pixelstreaming-websdk";
import { useAuth } from "@/context/AuthContext";
import { getMyProgress } from "@/services/progressService";
import { useNavigate, useLocation, useRevalidator } from "react-router-dom";
import { MdHome } from "react-icons/md";

export default function Mapa() {
  const { session, loadingAuth } = useAuth();
  const user = session?.user;

  const studentId = useMemo(
    () => (user?.dni ? String(user.dni) : null),
    [user?.dni]
  );
  return <div className="mx-auto max-w-[1600px]"></div>;
}
