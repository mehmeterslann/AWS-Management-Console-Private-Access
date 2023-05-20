sudo yum update
cd /root
curl -O https://raw.githubusercontent.com/angristan/openvpn-install/master/openvpn-install.sh
sudo chmod +x openvpn-install.sh
AUTO_INSTALL=y ./openvpn-install.sh
