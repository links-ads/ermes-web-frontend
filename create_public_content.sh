echo "begin"
case $1 in
    faster-dev)
        echo "faster-dev"
        cp -a public_project/faster/* build/
        cp -a public_project/config/config-faster-dev.json build/config.json
        sed -i "s/PROJECT_NAME/FASTER/" build/index.html
        ;;

    faster-test)
        echo "faster-test"
        cp -a public_project/faster/* build/
        cp -a public_project/config/config-faster-test.json build/config.json
        sed -i "s/PROJECT_NAME/FASTER/" build/index.html
        ;;
    safers-dev)
        echo "safers-dev"
        cp -a public_project/safers/* build/
        cp -a public_project/config/config-safers-dev.json build/config.json
        sed -i "s/PROJECT_NAME/SAFERS/" build/index.html
        ;;

    safers-test)
        echo "safers-test"
        cp -a public_project/safers/* build/
        cp -a public_project/config/config-safers-test.json build/config.json
        sed -i "s/PROJECT_NAME/SAFERS/" build/index.html
        ;;
        
    shelter-dev)
        echo "shelter-dev"
        cp -a public_project/shelter/* build/
        cp -a public_project/config/config-shelter-dev.json build/config.json
        sed -i "s/PROJECT_NAME/SHELTER/" build/index.html
        ;;

    shelter-test)
        echo "shelter-test"
        cp -a public_project/shelter/* build/
        cp -a public_project/config/config-shelter-test.json build/config.json
        sed -i "s/PROJECT_NAME/SHELTER/" build/index.html
        ;;
        
    *)
        echo $"unknown project"
        exit 1
esac

echo "Creating build.tar"
cd build
tar -caf build.tar *

echo "End of build process"
