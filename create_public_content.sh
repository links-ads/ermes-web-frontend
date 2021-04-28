echo "begin"
case $1 in
    faster)
        echo "faster"
        cp -a public_project/faster/* build/
        sed -i "s/PROJECT_NAME/FASTER/" build/index.html
        ;;
        
    shelter)
        echo "shelter"
        cp -a public_project/shelter/* build/
        sed -i "s/PROJECT_NAME/SHELTER/" build/index.html
        ;;
        
    *)
        echo $"unknown project"
        exit 1
esac

echo "end"
