/**
 * Settings Page
 * Update profil dan password
 */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, passwordSchema, type ProfileSchema, type PasswordSchema } from "@/lib/validations/auth.schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { User, Lock, Save, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";
import { updateProfile, updatePassword } from "@/lib/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import type { User as UserType } from "@/types";

interface SettingsClientProps {
  user: UserType;
}

export function SettingsClient({ user }: SettingsClientProps) {
  const [profilePending, startProfileTransition] = useTransition();
  const [passwordPending, startPasswordTransition] = useTransition();

  const profileForm = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user.name || "",
    },
  });

  const passwordForm = useForm<PasswordSchema>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirm_password: "",
    },
  });

  const onProfileSubmit = (data: ProfileSchema) => {
    const formData = new FormData();
    formData.append("name", data.full_name);
    startProfileTransition(async () => {
      const result = await updateProfile(formData);
      if (result?.error) toast.error(result.error);
      else toast.success("Profil diperbarui");
    });
  };

  const onPasswordSubmit = (data: PasswordSchema) => {
    const formData = new FormData();
    formData.append("password", data.password);
    formData.append("confirmPassword", data.confirm_password);
    startPasswordTransition(async () => {
      const result = await updatePassword(formData);
      if (result?.error) toast.error(result.error);
      else {
        toast.success("Password diperbarui");
        passwordForm.reset();
      }
    });
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-muted-foreground text-sm mt-1">Kelola profil dan keamanan akun Anda</p>
      </div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-6 mb-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">Profil</h2>
            <p className="text-xs text-muted-foreground">Update nama tampilan Anda</p>
          </div>
        </div>

        {/* Avatar Preview */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-muted/50 rounded-xl">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-primary/20 text-primary text-lg font-bold">
              {user.name ? getInitials(user.name) : "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user.name || "Nama belum diatur"}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <Form {...profileForm}>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
            <FormField
              control={profileForm.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Masukkan nama Anda"
                      disabled={profilePending}
                      className="h-11"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  value={user.email}
                  disabled
                  className="h-11 text-muted-foreground"
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                Email tidak dapat diubah melalui halaman ini
              </p>
            </FormItem>

            <Button type="submit" disabled={profilePending} className="mt-2">
              {profilePending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Profil
                </>
              )}
            </Button>
          </form>
        </Form>
      </motion.div>

      {/* Password Section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">Keamanan</h2>
            <p className="text-xs text-muted-foreground">Perbarui password akun Anda</p>
          </div>
        </div>

        <Form {...passwordForm}>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <FormField
              control={passwordForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password Baru</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Min. 6 karakter"
                      disabled={passwordPending}
                      className="h-11"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={passwordForm.control}
              name="confirm_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Konfirmasi Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Ulangi password baru"
                      disabled={passwordPending}
                      className="h-11"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" variant="outline" disabled={passwordPending}>
              {passwordPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memperbarui...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Perbarui Password
                </>
              )}
            </Button>
          </form>
        </Form>
      </motion.div>

      {/* App Info */}
      <div className="mt-8 text-center">
        <p className="text-xs text-muted-foreground/50">
          KasKu v1.0.0 — Aplikasi Pencatatan Kas
        </p>
      </div>
    </div>
  );
}
