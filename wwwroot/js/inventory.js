$(async function()
{
    let products = await loadProducts(); 
    let currentSort = (a, b) => 
    {
        if (a.unitsInStock == 0)
            return -1; 
        if (b.unitsInStock == 0)
            return 1;
        return (a.unitsInStock - a.reorderLevel) - (b.unitsInStock - b.reorderLevel); 
    };

    const pageSize = 10; 
    let currentPage = 0; 
    let maxPage = 0; 

    renderProducts();

    async function loadProducts()
    {
        return await $.getJSON({
            url: `../../api/product/discontinued/false/`,
            error: function (jqXHR, textStatus, errorThrown) 
            {
                // log the error to the console
                console.log("The following error occured: " + textStatus, errorThrown);
            }
        });
    }

    function renderProducts()
    {
        $('#product_rows').html('');
        let searchTerm = $('#product_search').val(); 
        products.sort(currentSort);

        let searchedProducts = [];
        for (let i = 0; i < products.length; i++)
        {
            if (searchTerm === undefined || products[i].productName.includes(searchTerm))
            {
                searchedProducts.push(products[i]);
            }
        }

        let currentIndex = currentPage * pageSize; 
        for (var i = currentIndex; i < currentIndex + pageSize; i++)
        {
            if (i >= searchedProducts.length) break; 

            let product = searchedProducts[i]; 
            let stockLevel = "high-stock";
            if (product.unitsInStock < product.reorderLevel)
            {
                if (product.unitsInStock == 0)
                    stockLevel = "low-stock";
                else
                    stockLevel = "medium-stock";
            }
    
            var row = `<tr data-id="${product.productId}" data-name="${product.productName}" data-price="${product.unitPrice}">
                <td class="${stockLevel}">${product.productName}</td>
                <td class="text-right ${stockLevel}">${product.category.categoryName}</td>
                <td class="text-right ${stockLevel}">${product.unitsInStock}</td>
                <td class="text-right ${stockLevel}">${product.reorderLevel}</td>
            </tr>`;
    
            $('#product_rows').append(row);
        }

        $('#page_buttons').html('');
        if (searchedProducts.length > 0)
        {
            maxPage = Math.ceil(searchedProducts.length / pageSize);
            for (let i = 0; i < searchedProducts.length; i += pageSize)
            {
                let index = i / pageSize;
                let active = index == currentPage ? 'activePageButton' : 'inactivePageButton';
                let button = `<button class='${active}' data-page='${index}'>${index + 1}</button>`;
                $('#page_buttons').append(button);
            }

            if (searchedProducts.length > pageSize)
            {
                $('#page_buttons').prepend('<i class="fa-solid fa-angles-left pointer" id="back"></i>');
                $('#page_buttons').append('<i class="fa-solid fa-angles-right pointer" id="next"></i>');
            }
        }
    }

    $('#product_search').on('input', function()
    {
        // reset page
        currentPage = 0; 
        // render products
        renderProducts();
    });

    function setActive(element)
    {
        $('.active').each(function()
        {
            // reset other active classes
            $(this).removeClass('active').addClass('inactive');
        });

        element.removeClass('inactive').addClass('active'); 
        
        // invert icon angle and return it's state
        let icon = element.children('i');
        if (icon.hasClass('fa-angle-down'))
        {
            icon.removeClass('fa-angle-down').addClass('fa-angle-up');
            return true;
        } else
        {
            icon.removeClass('fa-angle-up').addClass('fa-angle-down');
            return false; 
        }
    }

    $('#nameHeader').on('click', function()
    {
        let isUp = setActive($(this));
        if (isUp)
            currentSort = (a, b) => -a.productName.localeCompare(b.productName);
        else
            currentSort = (a, b) => a.productName.localeCompare(b.productName); 

        renderProducts(); 
    });

    $('#categoryHeader').on('click', function()
    {
        let isUp = setActive($(this));
        if (isUp)
            currentSort = (a, b) => -a.category.categoryName.localeCompare(b.category.categoryName);
        else
            currentSort = (a, b) => a.category.categoryName.localeCompare(b.category.categoryName);

        renderProducts(); 
    });

    $('#unitsHeader').on('click', function()
    {
        let isUp = setActive($(this)); 

        if (isUp)
            currentSort = (a, b) => b.unitsInStock - a.unitsInStock;
        else
            currentSort = (a, b) => a.unitsInStock - b.unitsInStock;

        renderProducts(); 
    });

    $('#reorderHeader').on('click', function()
    {
        let isUp = setActive($(this)); 
        if (isUp)
            currentSort = (a, b) => b.reorderLevel - a.reorderLevel;
        else
            currentSort = (a, b) => a.reorderLevel - b.reorderLevel; 

        renderProducts();
    });

    $('#page_buttons').on('click', 'button', function()
    {
        currentPage = $(this).data('page');
        renderProducts();
    });

    $('#page_buttons').on('click', 'i', function()
    {
        let old = currentPage;

        if ($(this).attr('id') == 'back')
        {
            currentPage--;
            if (currentPage < 0)
                currentPage = maxPage - 1;
        } else
        {
            currentPage++;
            if (currentPage >= maxPage)
                currentPage = 0;
        }
        
        // render products if page has changed
        if (old != currentPage)
            renderProducts();
    });

});