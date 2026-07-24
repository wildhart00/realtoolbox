import { Navigate, useParams } from "react-router-dom";

export default function SkillsSlugRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/toolbox/${slug ?? ""}`} replace />;
}
