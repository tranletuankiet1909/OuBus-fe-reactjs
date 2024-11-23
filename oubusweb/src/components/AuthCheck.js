import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthCheck = ({ children, dispatch }) => {
    const navigate = useNavigate();
    
    useEffect(() => {
        const checkLoginStatus = async () => {
        try {
            const token = localStorage.getItem('access-token');
            if (!token) {
                dispatch({ type: 'logout' }); 
                navigate('/login/'); 
                return;
            }
            console.info(token);
            if (token) {
            let userRes = await axios.get(`https://tltk.pythonanywhere.com/users/user-profile/`, {
                headers: { "Authorization": `Bearer ${token}` },
            });
            let userData = userRes.data;
            userData = {
                ...userData,  
                ...userData.user  
            };
            dispatch({ 
                type: 'login', 
                payload: userData, 
            });
            } 
        } catch (error) {
            console.error("Lỗi khi kiểm tra trạng thái đăng nhập", error);
            localStorage.removeItem('access-token');
            navigate('/login/'); 
        }
    };

    checkLoginStatus(); 
    }, [dispatch, navigate]);

    return children;  
};

export default AuthCheck;
