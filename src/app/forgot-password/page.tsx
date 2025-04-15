"use client";

import React, { useState } from "react";
import { Button, Container, TextField, Typography, Box, Alert } from "@mui/material";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_URL } from "@/config";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Validate email
      if (!email.trim()) {
        setError("Email is required");
        setIsSubmitting(false);
        return;
      }

      // Send request to API
      const response = await fetch(`${API_URL}/api/v1/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to process request");
      }

      // Show success message
      setSuccess(true);
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
          Forgot Password
        </Typography>

        {success ? (
          <Box sx={{ mt: 3, width: "100%" }}>
            <Alert severity="success">
              If your email is registered, you will receive a password reset link shortly.
            </Alert>
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Link href="/login">
                <Button variant="text" color="primary">
                  Return to Login
                </Button>
              </Link>
            </Box>
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
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              {isSubmitting ? "Sending..." : "Reset Password"}
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

export default ForgotPasswordPage; 