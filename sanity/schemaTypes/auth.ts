import { defineField, defineType } from "sanity";
import { UserIcon } from "lucide-react";

export const author = defineType({
  name: "author",
  title: "Author",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({
      name: "id",
      type: "number",
      title: "GitHub ID",
      description: "GitHub ID (用于旧版认证)",
      hidden: ({ document }) => !!document?.walletAddress,
    }),
    defineField({
      name: "walletAddress",
      type: "string",
      title: "钱包地址",
      description: "用户的以太坊钱包地址",
    }),
    defineField({
      name: "name",
      type: "string",
      title: "姓名",
    }),
    defineField({
      name: "username",
      type: "string",
      title: "用户名",
    }),
    defineField({
      name: "email",
      type: "string",
      title: "邮箱",
    }),
    defineField({
      name: "image",
      type: "url",
      title: "头像",
    }),
    defineField({
      name: "bio",
      type: "text",
      title: "简介",
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "walletAddress",
    },
  },
});