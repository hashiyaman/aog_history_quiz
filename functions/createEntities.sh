cat $1 | awk -F, '{for(i=2; i<=NF; i++) {c[$i]=$i}} END{for(i in c) print c[i]}' | sort | uniq | awk '{print $1","$1}' | tail -n +3
