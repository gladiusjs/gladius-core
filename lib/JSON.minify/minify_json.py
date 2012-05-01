'''
Created on 20/01/2011

v0.1 (C) Gerald Storer
MIT License

Based on JSON.minify.js: 
https://github.com/getify/JSON.minify
'''

import re

def json_minify(json,strip_space=True):
    tokenizer=re.compile('"|(/\*)|(\*/)|(//)|\n|\r')
    in_string = False
    in_multiline_comment = False
    in_singleline_comment = False
    
    new_str = []
    from_index = 0 # from is a keyword in Python
    
    for match in re.finditer(tokenizer,json):
        
        if not in_multiline_comment and not in_singleline_comment:
            tmp2 = json[from_index:match.start()]
            if not in_string and strip_space:
                tmp2 = re.sub('[ \t\n\r]*','',tmp2) # replace only white space defined in standard
            new_str.append(tmp2)
            
        from_index = match.end()
        
        if match.group() == '"' and not in_multiline_comment and not in_singleline_comment:
            escaped = re.search('(\\\\)*$',json[:match.start()])
            if not in_string or escaped is None or len(escaped.group()) % 2 == 0:
                # start of string with ", or unescaped " character found to end string
                in_string = not in_string
            from_index -= 1 # include " character in next catch
            
        elif match.group() == '/*' and not in_string and not in_multiline_comment and not in_singleline_comment:
            in_multiline_comment = True
        elif match.group() == '*/' and not in_string and in_multiline_comment and not in_singleline_comment:
            in_multiline_comment = False
        elif match.group() == '//' and not in_string and not in_multiline_comment and not in_singleline_comment:
            in_singleline_comment = True
        elif (match.group() == '\n' or match.group() == '\r') and not in_string and not in_multiline_comment and in_singleline_comment:
            in_singleline_comment = False
        elif not in_multiline_comment and not in_singleline_comment and (  
             match.group() not in ['\n','\r',' ','\t'] or not strip_space):
                new_str.append(match.group()) 
    
    new_str.append(json[from_index:])
    return ''.join(new_str)

if __name__ == '__main__':
    import json # requires Python 2.6+ to run tests
    
    def test_json(s):
        return json.loads(json_minify(s))
    
    test1 = '''// this is a JSON file with comments
{
    "foo": "bar",    // this is cool
    "bar": [
        "baz", "bum", "zam"
    ],
/* the rest of this document is just fluff
   in case you are interested. */
    "something": 10,
    "else": 20
}

/* NOTE: You can easily strip the whitespace and comments 
   from such a file with the JSON.minify() project hosted 
   here on github at http://github.com/getify/JSON.minify 
*/
'''

    test1_res = '''{"foo":"bar","bar":["baz","bum","zam"],"something":10,"else":20}'''
    
    test2 = '''
{"/*":"*/","//":"",/*"//"*/"/*/"://
"//"}

'''
    test2_res = '''{"/*":"*/","//":"","/*/":"//"}'''
    
    test3 = r'''/*
this is a 
multi line comment */{

"foo"
:
    "bar/*"// something
    ,    "b\"az":/*
something else */"blah"

}
'''
    test3_res = r'''{"foo":"bar/*","b\"az":"blah"}'''
    
    test4 = r'''{"foo": "ba\"r//", "bar\\": "b\\\"a/*z", 
    "baz\\\\": /* yay */ "fo\\\\\"*/o" 
}
'''
    test4_res = r'''{"foo":"ba\"r//","bar\\":"b\\\"a/*z","baz\\\\":"fo\\\\\"*/o"}'''
    
    assert test_json(test1) == json.loads(test1_res),'Failed test 1'
    assert test_json(test2) == json.loads(test2_res),'Failed test 2'
    assert test_json(test3) == json.loads(test3_res),'Failed test 3'
    assert test_json(test4) == json.loads(test4_res),'Failed test 4'
    if __debug__: # Don't print passed message if the asserts didn't run
        print 'Passed all tests'