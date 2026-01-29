#!/bin/bash

BASE_URL="http://localhost:3000/api/auth"
EMAIL="test@example.com"
PASSWORD="password123"

# 1. Register
echo "Testing Registration..."
curl -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\", \"name\": \"Test User\"}" \
  -c cookies.txt
echo -e "\n"

# 2. Login
echo "Testing Login..."
curl -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}" \
  -c cookies.txt
echo -e "\n"

# 3. Check Session (Me)
echo "Testing /me Endpoint..."
curl -X GET "$BASE_URL/me" \
  -b cookies.txt
echo -e "\n"

# 4. Logout
echo "Testing Logout..."
curl -X POST "$BASE_URL/logout" \
  -b cookies.txt \
  -c cookies.txt
echo -e "\n"

# 5. Check Session again (should fail)
echo "Testing /me after logout..."
curl -X GET "$BASE_URL/me" \
  -b cookies.txt
echo -e "\n"
