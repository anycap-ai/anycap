"use client";

import { useUser } from "@/lib/api/hooks";
import { UserAvatarMenu, UserAvatar } from "@/components/ui/UserAvatarMenu";

export function UserProfileHeader() {
  const { data: user } = useUser();

  const displayName = user?.name || user?.email || user?.id || "";

  return (
    <UserAvatarMenu
      className="ml-auto"
      trigger={
        <div className="flex items-center gap-3 cursor-default">
          <span className="text-[12px] text-[#5f6358] tracking-[0.2px]">
            {displayName}
          </span>
          <UserAvatar picture={user?.avatar_url} name={displayName} size={32} />
        </div>
      }
    />
  );
}
