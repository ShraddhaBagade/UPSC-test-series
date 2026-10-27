import { Navigate, useLocation, useSearchParams } from "react-router-dom";

export default function Register() {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const stateFrom =
    typeof location.state?.from === "string"
      ? location.state.from
      : location.state?.from?.pathname;

  const requestedDestination =
    searchParams.get("returnTo") || searchParams.get("redirect") || stateFrom;

  const returnTo = ["/checkout", "/my-purchases"].includes(requestedDestination)
    ? requestedDestination
    : "/my-purchases";

  return (
    <Navigate to={`/login?returnTo=${encodeURIComponent(returnTo)}`} replace />
  );
}
