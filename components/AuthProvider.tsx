"use client";

import { Authenticator, View } from "@aws-amplify/ui-react";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Authenticator>
      <View>{children}</View>
    </Authenticator>
  );
}
