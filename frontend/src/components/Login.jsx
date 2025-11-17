import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGoogle } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

const Login = () => {
  const [message, setMessage] = useState("");
  const { loginUser, signInWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [submitting, setSubmitting] = useState(false);

  // helper: small reusable toast
  const toast = (title, icon = 'success', timer = 1800) => {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon,
      title,
      showConfirmButton: false,
      timer,
      timerProgressBar: true,
    });
  };

  // decide destination after login
  const goAfterLogin = () => {
    try {
      // if auth context exposes a currentUser with role, send admin to dashboard
      if (currentUser && currentUser.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } catch {
      navigate('/');
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await loginUser(data.email, data.password);

      toast('Login successful!', 'success');

      // small delay to allow auth context to update (if necessary), then redirect
      setTimeout(() => {
        goAfterLogin();
      }, 200);
    } catch (error) {
      setMessage("Please provide a valid email and password");
      console.error(error);
      toast('Login failed. Check credentials.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setSubmitting(true);
    try {
      await signInWithGoogle();
      toast('Login successful!', 'success');

      // wait briefly then navigate
      setTimeout(() => {
        goAfterLogin();
      }, 200);
    } catch (error) {
      console.error(error);
      toast('Google sign in failed!', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col">
      {/* Minimal top bar: only back-to-site link */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <Link to="/" className="text-sm text-gray-600 hover:underline">← Back to site</Link>
        </div>
      </header>

      {/* Centered login card */}
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-sm mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-xl font-semibold mb-4">Please Login</h2>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email</label>
              <input
                {...register("email", { required: true })}
                type="email"
                name="email"
                id="email"
                placeholder="Email Address"
                className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                disabled={submitting}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">Email is required.</p>}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Password</label>
              <input
                {...register("password", { required: true })}
                type="password"
                name="password"
                id="password"
                placeholder="Password"
                className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                disabled={submitting}
              />
              {errors.password && <p className="text-xs text-red-500 mt-1">Password is required.</p>}
            </div>

            {message && <p className="text-red-500 text-xs italic mb-3">{message}</p>}

            <div className="mb-3">
              <button
                type="submit"
                disabled={submitting}
                className={`w-full ${submitting ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-700'} text-white font-bold py-2 px-8 rounded focus:outline-none`}
              >
                {submitting ? 'Signing in…' : 'Login'}
              </button>
            </div>
          </form>

          <p className="align-baseline font-medium mt-2 text-sm">
            Haven't an account? Please <Link to="/register" className="text-blue-500 hover:text-blue-700">Register</Link>
          </p>

          {/* google sign in */}
          <div className="mt-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={submitting}
              className={`w-full flex items-center justify-center gap-3 ${submitting ? 'bg-gray-300' : 'bg-red-600 hover:bg-red-700'} text-white font-bold py-2 px-4 rounded focus:outline-none`}
            >
              <FaGoogle className="mr-1" />
              {submitting ? 'Signing in…' : 'Sign in with Google'}
            </button>
          </div>

          <p className="mt-5 text-center text-gray-500 text-xs">©2025 Book Store. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
