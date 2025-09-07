// 假设这是您的 startup schema 文件
export default {
  name: 'startup',
  title: 'Startup',
  type: 'document',
  fields: [
    // 其他现有字段...
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
    // ...其他字段
    
    // 添加钱包地址字段
    {
      name: 'authorWalletAddress',
      title: 'Author Wallet Address',
      type: 'string',
      description: 'Ethereum wallet address of the author for receiving MIK tokens',
    },
  ],
  // 其他配置...
};