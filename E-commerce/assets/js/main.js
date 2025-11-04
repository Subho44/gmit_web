(
    function() {
        document.querySelectorAll('a[href^="#"]').forEach(a=>{
            a.addEventListener('click', e=>{
                const target = document.querySelector(a.getAttribute('href'));
                if(target) {
                    e.preventDefault();
                    target.scrollIntoView({behavior:'smooth'});
                }
            });
        });

        document.querySelectorAll('[data-add-to-cart]').forEach(btn => {
            btn.addEventListener('click',()=>{
                const name = btn.getAttribute('data-name') ||'Product';
                showtoast(`${name} added to cart`);
                
            });
        });

        function showtoast(message) {
            const div = document.createElement('div');
            div.className = 'toast position-fixed bg-dark text-white p-3 rounded';
            div.style.bottom ='20px';
            div.style.right = '20px';
            div.textContent = message;

            document.body.appendChild(div);
            setTimeout(()=> div.remove(),2000);
        }
    })();