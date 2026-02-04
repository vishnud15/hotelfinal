export default function decorate(block){    
    const ul= document.createElement('ul');

    [... block.children].forEach((row) => {

        const li=document.createElement('li');

        while (row.firstChild) li.appendChild(row.firstChild);
        [...li.children].forEach((div) => {
            if(div.children.length === 1 && div.querySelector('picture')){
                div.className='card-image';
            }else{
                div.className= 'card-body';
            }
        });
        ul.append(li);
      });

      block.textContent='';
      block.append(ul);
    }
