import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "../../../api/updateUser";
import { AppDispatch, RootState } from "../../../../../app/store";
import { setCurrentUser } from "../../../../../app/store/slices/authSlice";
import { useNavigate } from "react-router-dom";

export const useSettings = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth);

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const save = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await updateUser({ name, email });
      dispatch(
        setCurrentUser({
          name: name,
          email: email,
          avatar: avatar,
        })
      );

      if (email !== user.email && !updatedUser.is_verified) {
        navigate(`/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        navigate("/")
      }
    } catch (err: any) {
      setError(err.message || "Ошибка обновления");
    } finally {
      setLoading(false);
    }
  };

  return {
    name,
    setName,
    email,
    setEmail,
    avatar,
    setAvatar,
    save,
    loading,
    error,
  };
};
