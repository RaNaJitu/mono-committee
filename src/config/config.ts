type Environments = "DEVELOPMENT" | "PRODUCTION" | "TEST";
class Config {
  public env: Environments;
  public port: number;
  public firebase_api_key: string;
  public secret_hash_key: string;
  public jwt_secret: string;
  public recaptcha_secret: string;
  public cs_secret_key: string;
  public cs_agent_code: string;
  public str_secret_key: string;
  public str_agent_code: string;
  public test_token: string;
  public cs_ws_endpoint: string;
  public s3_access_key_id: string;
  public s3_secret_key: string;
  public s3_rzpg_bucket_name: string;
  public s3_public_bucket_name: string;
  public redis_url: string;
  public casino_jwt_secret: string;
  public fawks_operator_id: string;
  public fawks_ip: string;
  public gap_operator_rsa_public_key: string;
  public gap_operator_rsa_private_key: string;
  public gap_operator_id: string;
  public gap_provider_public_key: string;
  public gap_provider_host: string;
  public sbook_operator_id: string;
  public sbook_partner_id: string;
  public sbook_public_key: string;
  public sbook_private_key: string;
  public sbook_host: string;
  public podds_operator_id: string;
  public podds_partner_id: string;
  public podds_public_key: string;
  public podds_private_key: string;
  public podds_host: string;

  public socket_port: number;
  public qtech_api_base: string;
  public qtech_pass_phrase: string;
  public qtech_api_user_name: string;
  public qtech_api_password: string;
  public supabase_url: string;
  public mongodb_url:string;
  public supabase_key: string;
  public ip_geo_location_api_key: string;
  public redis_password:string;
  public socket_server_url:string;
  public socket_server_token:string;
  public onbuka_api_id:string;
  public onbuka_api_key:string ;
  public onbuka_api_secret:string;
  public onbuka_sms_url:string;

  public players_common_tag:string;

  public live_match_sports_url: string;
  public verify_banking_otp: boolean;
  public redis_adapter_url:string ;
  public redis_adapter_password:string;
  
  public branch_api_token:string;

  public pending_transaction_limit:number;

  public place_bet_bypass_token:string;

  public admin_queue_url: string
  public scorecard_url: string

  constructor(env: NodeJS.ProcessEnv) {
    this.env = (env.NODE_ENV as Environments) || "DEVELOPMENT";

    this.port = this.getNumberValue(env.PORT);
    this.firebase_api_key = this.getFireBaseAPIKey(env.FIREBASE_API_KEY);
    this.secret_hash_key = this.getSecretHashKey(env.SECRET_HASH__KEY);
    this.jwt_secret = this.getJwtSecret(env.JWT_SECRET);
    this.recaptcha_secret = this.getRecaptchaSecret(env.RECAPTCHA_SECRET);
    this.cs_secret_key = this.getCSSecretKey(env.CS_SECRET_KEY);
    this.cs_agent_code = this.getCSSAgentCode(env.CS_AGENT_CODE);
    this.str_secret_key = this.getCSSecretKey(env.STR_SECRET_KEY);
    this.str_agent_code = this.getCSSAgentCode(env.STR_AGENT_CODE);
    this.test_token = env.WL_AUTHENTICATION_TOKEN || "";
    this.cs_ws_endpoint = env.CS_WS_ENDPOINT || "";
    this.s3_access_key_id = this.getS3AccessKeyId(env.S3_ACCESS_KEY_ID);
    this.s3_secret_key = this.getS3SecretKey(env.S3_SECRET_KEY);
    this.redis_url = env.REDIS_URL || ""
    this.s3_rzpg_bucket_name = this.getS3RZPBucketName(env.S3_RZPG_BUCKET_NAME);
    this.s3_public_bucket_name = this.getS3RZPBucketName(env.S3_PUBLIC_BUCKET_NAME);
    this.redis_url = env.REDIS_URL || "";
    this.casino_jwt_secret = env.CASINO_JWT_SECRET || "";
    this.fawks_operator_id = env.FAWKS_OPERATOR_ID || "";
    this.fawks_ip = env.FAWKS_IP || "";
    this.qtech_api_base = env.QTECH_API_BASE || "";
    this.qtech_pass_phrase = env.QTECH_PASS_PHRASE || "";
    this.qtech_api_user_name = env.QTECH_API_USER_NAME || "";
    this.qtech_api_password = env.QTECH_API_PASSWORD || "";
    this.sbook_operator_id = env.SBOOK_OPERATOR_ID || "";
    this.sbook_partner_id = env.SBOOK_PARTNER_ID || "";
    this.sbook_public_key = this.getRSAKey(env.SBOOK_PUBLIC_KEY);
    this.sbook_private_key = this.getRSAKey(env.SBOOK_PRIVATE_KEY);
    this.sbook_host = env.SBOOK_HOST || "";
    this.podds_operator_id = env.PODDS_OPERATOR_ID || "";
    this.podds_partner_id = env.PODDS_PARTNER_ID || "";
    this.podds_public_key = this.getRSAKey(env.PODDS_PUBLIC_KEY);
    this.podds_private_key = this.getRSAKey(env.PODDS_PRIVATE_KEY);
    this.podds_host = env.PODDS_HOST || "";

    this.gap_operator_rsa_public_key = this.getRSAKey(env.GAP_OPERATOR_RSA_PUBLIC_KEY) || "";
    this.gap_operator_rsa_private_key = this.getRSAKey(env.GAP_OPERATOR_RSA_PRIVATE_KEY) || "";
    this.gap_operator_id = env.GAP_OPERATOR_ID || "";
    this.gap_provider_public_key = this.getRSAKey(env.GAP_PROVIDER_PUBLIC_KEY) || "";
    this.gap_provider_host = env.GAP_PROVIDER_HOST || "";
    this.socket_port = Number(env.SOCKET_PORT) || 4011;
    this.supabase_url = env.SUPABASE_URL || "";
    this.supabase_key = env.SUPABASE_KEY || "";
    this.mongodb_url = env.MONGODB_URL || "";
    this.ip_geo_location_api_key = env.IP_GEOLOCATION_API_KEY || "";
    this.redis_password = env.REDIS_PWD || "";
    this.socket_server_url = env.SOCKET_SERVER_URL||"" 
    this.socket_server_token  = env.SOCKET_SERVER_TOKEN || ""
    this.onbuka_api_id  = env.ONBUKA_API_ID ||""
    this.onbuka_api_key = env.ONBUKA_API_KEY ||""
    this.onbuka_api_secret = env.ONBUKA_API_SECRET ||""
    this.onbuka_sms_url = env.ONBUKA_SMS_URL ||""

    this.players_common_tag = env.PLAYERS_COMMON_TAG || ""
    this.live_match_sports_url = env.LIVE_MATCH_SPORTS_URL || "";

    this.verify_banking_otp = this.getBooleanValue(env.VERIFY_BANKING_OTP);
    this.redis_adapter_url = env.REDIS_ADAPTER_URL || ""
    this.redis_adapter_password = env.REDIS_ADAPTER_PWD || ""

    this.pending_transaction_limit = Number(env.PENDING_TRANSACTION_LIMIT) || 0;

    this.branch_api_token = env.BRANCH_API_TOKEN || ""

    this.place_bet_bypass_token = env.PLACE_BET_BYPASS_TOKEN || "" 
    this.admin_queue_url = env.ADMIN_QUEUE_URL || ""
    this.scorecard_url = env.SCORECARD_URL || ""
  }

  private getNumberValue(value: string | undefined) {
    return Number(value);
  }
  private getFireBaseAPIKey(value: string | undefined) {
    return String(value);
  }
  private getSecretHashKey(value: string | undefined) {
    return String(value);
  }
  private getJwtSecret(value: string | undefined) {
    return String(value);
  }
  private getRecaptchaSecret(value: string | undefined) {
    return String(value);
  }
  private getCSSecretKey(value: string | undefined) {
    return String(value);
  }
  private getCSSAgentCode(value: string | undefined) {
    return String(value);
  }
  private getS3RZPBucketName(value: string | undefined) {
    return String(value);
  }
  private getS3AccessKeyId(value: string | undefined) {
    return String(value);
  }
  private getS3SecretKey(value: string | undefined) {
    return String(value);
  }
  private getBooleanValue(value: string | undefined) {
    return value === "true";
  }
  private getRSAKey(value: string | undefined) {
    return String(value).split(String.raw`\n`).join("\n");
  }
}

export default Config;
