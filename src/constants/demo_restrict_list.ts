
export const demo_user_restrict_list = [
    "POST-/user/payment/client/transaction/create", // restrict create transaction
    "PUT-/user/profile/user-info", // restrict update user profile
    "POST-/user/profile/change-password", // restrict change password
    "POST-/user/profile/bank-info", // restrict add bank info
    "POST-/user/profile/withdraw-request-info", // restrict add withdraw request
    "PATCH-/user/profile/update-bet-sets", // restrict update bet settings
    "POST-/user/bets/place_bet", // restrict place bet
    "POST-/user/bets/cancel_bets", // restrict cancel bets
    "POST-/user/payment/client/payout/create", // restrict create payout
    "PUT-/user/profile/create_withdraw_password" // restrict create withdraw password
]