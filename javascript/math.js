
// latest covid data-set date
const DATE = "2020-06-21";


/***** ALL MATH FUNCTIONS ****/




/**
 * Filters top-10 and least-10 affected countries in array
 * @param {data} a csv data set
 * @param {level} a string {"most", "least"}
 */
function getAffected(data, level) {
    
    let cs        = [],
        td        = [],
        nc        = [],
        list      = [],
        countries = [];
    
    var num, index;
    
    data.map(d => {
        if (d.date === DATE) {
            nc.push(+d.new_cases);
            cs.push(+d.total_cases);
            td.push(+d.total_deaths);
            countries.push(d.location);
        }
    });
    
    
    for(var j = 0; j <= 10; j++) {
        
        if (level == "most") {
            num = d3.max(cs);
            
        } else if (level == "least") {
            num = d3.min(cs);
        }
        
        index = cs.indexOf(num);
        
        if (j == 0) {
            cs.splice(index, 1);
            td.splice(index, 1);
            nc.splice(index, 1);
            countries.splice(index, 1);
            
        } else {
            if (countries[index] === "United States") {
                countries[index] = "U.S.A";
                
            } else if (countries[index] === "United Kingdom") {
                countries[index] = "U.K";
                
            }
            var a = {
                "total_case"  : num,
                "new_case"    : nc[index],
                "total_death" : td[index],
                "country"     : countries[index]
            };
            
            list.push(a);
            cs.splice(index, 1);
            td.splice(index, 1);
            nc.splice(index, 1);
            countries.splice(index, 1);
        }

    }
    
    return list;
}



/**************end of math functions**********************/