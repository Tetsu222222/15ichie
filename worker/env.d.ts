// wrangler types で生成した Env に、Secret（wrangler.jsonc に書かないもの）の型を足す
interface Env {
  /** ご注文フォームの送り先（カンマ区切り）。Secret で設定する */
  CONTACT_TO?: string;
}
