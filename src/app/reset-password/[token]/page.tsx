"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { Button, Container, TextField, Typography, Box, Alert } from "@mui/material";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_ENDPOINTS } from "@/config";

interface ResetPasswordProps {
  params: {
    token: string;
  };
}

const ResetPasswordPage = ({ params }: ResetPasswordProps) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { token } = params;

  const validateForm = () => {
    if (!password.trim()) {
      setError("Password is required");
      return false;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(API_ENDPOINTS.resetPasswordConfirm, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);

    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Typography component="h1" variant="h5">
          Reset Password
        </Typography>

        {success ? (
          <Box sx={{ mt: 3, width: "100%" }}>
            <Alert severity="success">
              Your password has been successfully reset. Redirecting to login page...
            </Alert>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: "100%" }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="New Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />

            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm New Password"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
              disabled={isSubmitting}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </Button>

            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Link href="/login">
                <Button variant="text" color="primary">
                  Back to Login
                </Button>
              </Link>
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default ResetPasswordPage;
