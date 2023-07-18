---Sin calificar
SELECT 
    ee.nombre AS nombre_espacio_entrega,
    de.fecha_entrega,
    p.nombre AS nombre_proyecto,
    r.nombre AS nombre_rol,
    u.nombre AS evaluador
FROM 
    documento_entrega de
    INNER JOIN espacio_entrega ee ON de.id_espacio_entrega = ee.id
    INNER JOIN proyecto p ON de.id_proyecto = p.id
    INNER JOIN usuario_rol ur ON p.id = ur.id_proyecto AND ee.id_rol = ur.id_rol
    INNER JOIN usuario u ON ur.id_usuario = u.id
    INNER JOIN rol r ON ur.id_rol = r.id
WHERE 
    de.id NOT IN (SELECT id_documento_entrega FROM calificacion)
ORDER BY 
    de.fecha_entrega;


--calificados
SELECT 
    ee.nombre AS nombre_espacio_entrega,
    de.fecha_entrega,
    p.nombre AS nombre_proyecto,
    r.nombre AS nombre_rol,
    u.nombre AS evaluador,
    c.fecha_calificacion,
    c.puntaje_total
FROM 
    documento_entrega de
    INNER JOIN espacio_entrega ee ON de.id_espacio_entrega = ee.id
    INNER JOIN proyecto p ON de.id_proyecto = p.id
    INNER JOIN usuario_rol ur ON p.id = ur.id_proyecto AND ee.id_rol = ur.id_rol
    INNER JOIN usuario u ON ur.id_usuario = u.id
    INNER JOIN rol r ON ur.id_rol = r.id
    LEFT JOIN calificacion c ON de.id = c.id_documento_entrega
WHERE 
    de.id NOT IN (SELECT id_documento_entrega FROM calificacion)
    OR c.id IS NOT NULL
ORDER BY 
    de.fecha_entrega;
