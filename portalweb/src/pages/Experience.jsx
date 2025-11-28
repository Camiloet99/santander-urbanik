import { useEffect, useMemo, useRef } from "react";
import { useAuth } from "@/context/AuthContext";

export default function Experience() {
  const { session, loadingAuth } = useAuth();
  const user = session?.user;

  const studentId = useMemo(
    () => (user?.dni ? String(user.dni) : null),
    [user?.dni]
  );
  return <div className="mx-auto max-w-[1600px]"></div>;
}
