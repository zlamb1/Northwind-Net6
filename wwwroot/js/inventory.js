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
        $('#product_rows').html("");
        let searchTerm = $('#product_search').val(); 
        products.sort(currentSort);

        for (var i = 0; i < products.length; i++)
        {
            let product = products[i]; 
            if (searchTerm === undefined || product.productName.includes(searchTerm))
            {
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
        }
    }

    $('#product_search').on('input', function()
    {
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

});