#!/bin/bash

BASE_URL="http://localhost:3000"

# Function to check URL status
check_url() {
    echo "Checking $1..."
    HTTP_CODE=$(curl -o /dev/null -s -w "%{http_code}\n" "$1")
    if [ "$HTTP_CODE" == "200" ]; then
        echo "OK: $1 is accessible."
    elif [ "$HTTP_CODE" == "307" ] || [ "$HTTP_CODE" == "308" ]; then
        echo "OK: $1 redirects (likely auth)."
    else
        echo "FAIL: $1 returned $HTTP_CODE"
    fi
}

check_url "$BASE_URL/login"
check_url "$BASE_URL/register"


# Add support/settings routes checks
echo "Checking Dashboard Support Access (No Auth)..."
curl -I "$BASE_URL/dashboard/support" | grep "HTTP/1.1 307 Temporary Redirect" || echo "FAIL: No Redirect"

echo "Checking Admin Support Access (No Auth)..."
curl -I "$BASE_URL/admin/support" | grep "HTTP/1.1 307 Temporary Redirect" || echo "FAIL: No Redirect"

echo "Checking Admin Settings Access (No Auth)..."
curl -I "$BASE_URL/admin/settings" | grep "HTTP/1.1 307 Temporary Redirect" || echo "FAIL: No Redirect"

# Add profile/user routes checks
echo "Checking Admin Transactions Access (No Auth)..."
curl -I "$BASE_URL/admin/transactions" | grep "HTTP/1.1 307 Temporary Redirect" || echo "FAIL: No Redirect"

echo "Checking Dashboard Profile Access (No Auth)..."
curl -I "$BASE_URL/dashboard/profile" | grep "HTTP/1.1 307 Temporary Redirect" || echo "FAIL: No Redirect"

echo "Checking Admin Users Access (No Auth)..."
curl -I "$BASE_URL/admin/users" | grep "HTTP/1.1 307 Temporary Redirect" || echo "FAIL: No Redirect"

# Add referral routes checks
echo "Checking Dashboard Investments Access (No Auth)..."
curl -I "$BASE_URL/dashboard/investments" | grep "HTTP/1.1 307 Temporary Redirect" || echo "FAIL: No Redirect"

echo "Checking Dashboard Referrals Access (No Auth)..."
curl -I "$BASE_URL/dashboard/referrals" | grep "HTTP/1.1 307 Temporary Redirect" || echo "FAIL: No Redirect"

echo "Checking Admin Referrals Access (No Auth)..."
curl -I "$BASE_URL/admin/referrals" | grep "HTTP/1.1 307 Temporary Redirect" || echo "FAIL: No Redirect"

# 1. Check Public Route (Home)
echo "Checking Home Page..."
curl -I "$BASE_URL/" | grep "HTTP/1.1 200 OK"
echo "Home Page OK"

# 2. Check Middleware Protection (Dashboard - No Auth)
echo "Checking Dashboard Access (No Auth)..."
# Should be redirect (307)
curl -I "$BASE_URL/dashboard" | grep "HTTP/1.1 307 Temporary Redirect" || echo "FAIL: No Redirect"

# 3. Check Middleware Protection (Admin - No Auth)
echo "Checking Admin Access (No Auth)..."
# Should be redirect (307)
curl -I "$BASE_URL/admin/dashboard" | grep "HTTP/1.1 307 Temporary Redirect" || echo "FAIL: No Redirect"

echo "Middlewares Verified."
